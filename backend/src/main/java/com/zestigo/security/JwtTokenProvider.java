package com.zestigo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.Key;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long expiration;
    private final String clerkPublishableKey;
    private final String clerkSecretKey;
    private final Map<String, PublicKey> clerkPublicKeysCache = new ConcurrentHashMap<>();

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration,
            @Value("${clerk.publishable-key:}") String clerkPublishableKey,
            @Value("${clerk.secret-key:}") String clerkSecretKey) {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
        this.clerkPublishableKey = clerkPublishableKey;
        this.clerkSecretKey = clerkSecretKey;
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        if (isClerkToken(token)) {
            String kid = getKidFromTokenHeader(token);
            PublicKey publicKey = getClerkPublicKey(kid);
            if (publicKey == null) {
                throw new io.jsonwebtoken.security.SignatureException("Clerk public key not found for kid: " + kid);
            }
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } else {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        }
    }

    public boolean validateToken(String token) {
        try {
            if (isClerkToken(token)) {
                String kid = getKidFromTokenHeader(token);
                PublicKey publicKey = getClerkPublicKey(kid);
                if (publicKey == null) {
                    return false;
                }
                Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
                return true;
            } else {
                Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
                return true;
            }
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid, expired, malformed, or signature verification failed
        }
        return false;
    }

    private boolean isClerkToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length > 0) {
                byte[] decoded = Base64.getUrlDecoder().decode(parts[0]);
                String headerJson = new String(decoded);
                return headerJson.contains("RS256") || headerJson.contains("kid");
            }
        } catch (Exception e) {
            // ignore
        }
        return false;
    }

    private String getKidFromTokenHeader(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length > 0) {
                byte[] decoded = Base64.getUrlDecoder().decode(parts[0]);
                String headerJson = new String(decoded);
                int kidIndex = headerJson.indexOf("\"kid\"");
                if (kidIndex != -1) {
                    int colonIndex = headerJson.indexOf(":", kidIndex);
                    int startQuote = headerJson.indexOf("\"", colonIndex);
                    int endQuote = headerJson.indexOf("\"", startQuote + 1);
                    if (startQuote != -1 && endQuote != -1) {
                        return headerJson.substring(startQuote + 1, endQuote);
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    private PublicKey getClerkPublicKey(String kid) {
        if (kid == null) return null;
        if (clerkPublicKeysCache.containsKey(kid)) {
            return clerkPublicKeysCache.get(kid);
        }
        fetchAndCacheClerkJwks();
        return clerkPublicKeysCache.get(kid);
    }

    private synchronized void fetchAndCacheClerkJwks() {
        try {
            String jwksUrl = getClerkJwksUrl();
            if (jwksUrl == null) {
                return;
            }
            
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(jwksUrl))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                parseJwksJsonAndCache(response.body());
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch Clerk JWKS: " + e.getMessage());
        }
    }

    private String getClerkJwksUrl() {
        if (clerkPublishableKey == null || clerkPublishableKey.isBlank()) {
            return null;
        }
        try {
            String parts[] = clerkPublishableKey.split("_");
            String base64Str = parts[parts.length - 1];
            byte[] decoded = Base64.getDecoder().decode(base64Str);
            String decodedStr = new String(decoded);
            if (decodedStr.endsWith("$")) {
                decodedStr = decodedStr.substring(0, decodedStr.length() - 1);
            }
            return "https://" + decodedStr + "/.well-known/jwks.json";
        } catch (Exception e) {
            System.err.println("Failed to parse Clerk Publishable Key: " + e.getMessage());
            return null;
        }
    }

    private void parseJwksJsonAndCache(String jwksJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jwksJson);
            JsonNode keysNode = rootNode.path("keys");
            if (keysNode.isArray()) {
                for (JsonNode keyNode : keysNode) {
                    String kty = keyNode.path("kty").asText();
                    String kid = keyNode.path("kid").asText();
                    String alg = keyNode.path("alg").asText();
                    if ("RSA".equals(kty) && "RS256".equals(alg)) {
                        String nStr = keyNode.path("n").asText();
                        String eStr = keyNode.path("e").asText();
                        
                        byte[] nBytes = Base64.getUrlDecoder().decode(nStr);
                        byte[] eBytes = Base64.getUrlDecoder().decode(eStr);
                        
                        BigInteger modulus = new BigInteger(1, nBytes);
                        BigInteger exponent = new BigInteger(1, eBytes);
                        
                        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                        KeyFactory factory = KeyFactory.getInstance("RSA");
                        PublicKey publicKey = factory.generatePublic(spec);
                        
                        clerkPublicKeysCache.put(kid, publicKey);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse JWKS JSON: " + e.getMessage());
        }
    }
}

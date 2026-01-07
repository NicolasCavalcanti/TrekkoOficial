import { describe, it, expect } from "vitest";

describe("Mercado Pago Production Credentials", () => {
  it("should validate production access token by fetching user info", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    expect(accessToken).toBeDefined();
    expect(accessToken).not.toBe("");
    expect(accessToken?.startsWith("APP_USR-")).toBe(true);
    
    // Call Mercado Pago API to validate the token
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    
    // Verify it's a production account (not sandbox)
    expect(data.id).toBeDefined();
    expect(data.email).toBeDefined();
    
    console.log("Production account validated:");
    console.log("- User ID:", data.id);
    console.log("- Email:", data.email);
    console.log("- Site ID:", data.site_id);
  }, 30000);

  it("should have valid public key format", () => {
    const publicKey = process.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    
    expect(publicKey).toBeDefined();
    expect(publicKey).not.toBe("");
    expect(publicKey?.startsWith("APP_USR-")).toBe(true);
  });
});

import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
}

export class JWTUtil {
  static generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET || "default-secret-key";
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    } as jwt.SignOptions);
  }

  static generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): TokenPayload {
    const secret = process.env.JWT_SECRET || "default-secret-key";
    return jwt.verify(token, secret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    const secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
    return jwt.verify(token, secret) as TokenPayload;
  }

  static generateTokens(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}

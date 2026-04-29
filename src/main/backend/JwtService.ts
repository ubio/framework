import jsonwebtoken from 'jsonwebtoken';
import { config } from 'mesh-config';

export class JwtService {

    @config({ default: 'RS256' }) private JWT_ALGORITHM!: 'HS256' | 'RS256';
    @config() private JWT_ISSUER!: string;
    @config() private JWT_PUBLIC_KEY!: string;
    @config() private JWT_PRIVATE_KEY!: string;

    createToken(
        payload: Record<string, any>,
        expiresInSeconds: number,
    ): string {
        return jsonwebtoken.sign({
            payload,
        }, this.JWT_PRIVATE_KEY, {
            algorithm: this.JWT_ALGORITHM,
            issuer: this.JWT_ISSUER,
            expiresIn: expiresInSeconds,
        });
    }

    decodeToken<T>(token: string): T {
        const jwt = jsonwebtoken.verify(token, this.JWT_PUBLIC_KEY, {
            issuer: this.JWT_ISSUER,
        });
        if (typeof jwt === 'string' || !jwt.payload) {
            throw new Error('Unsupported JWT');
        }
        return jwt.payload as T;
    }

}

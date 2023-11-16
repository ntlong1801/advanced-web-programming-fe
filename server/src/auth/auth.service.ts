import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  private async validatePassword(enteredPassword: string, dbPassword: string) {
    return await bcrypt.compare(enteredPassword, dbPassword);
  }

  async signup(username: string, password: string) {
    const user = await this.userService.createUser(username, password);
    const payload = { id: user.id, username: user.username };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signIn(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);
    if (user && (await this.validatePassword(pass, user.password))) {
      const payload = { id: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
    
    throw new UnauthorizedException();
  }
}

/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('signIn')
  signIn(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('signUp')
  signUp(@Body() dto: AuthDto) {
    console.log({ dto })
    return this.authService.signUp(dto);
  }
}

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService) { }

  login(email: string, password: string) {
    // alguma logica para buscar usuario no banco pelo email
    // verificar as senhas
    // gerar o token
    // retornar o token
    const payload = { email, nome: 'teste', };
    return { 
      access_token: this.jwtService.sign(payload),
    };
  }

}
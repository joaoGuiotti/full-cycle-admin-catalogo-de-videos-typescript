import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { PayloadUser } from "../models/user.model";

@Injectable()
export class AdminGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();

    if (!request['user']) 
      throw new UnauthorizedException();

    const payload: PayloadUser = request['user'];
    const roles = payload?.realm_access?.roles || [];
    const isAdmin = roles.indexOf('admin-catalog') !== -1;
    if (!isAdmin) {
      throw new ForbiddenException();
    }
    return true;
  }

}

// Autenticação 
// Autorização
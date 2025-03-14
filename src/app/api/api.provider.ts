import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { ApiService } from "./api.service";
import { addTokenInterceptor } from "./api.interceptor";

export function provideApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([addTokenInterceptor])),
    ApiService,
  ]);
}

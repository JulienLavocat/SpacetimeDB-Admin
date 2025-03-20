import { bootstrapApplication } from "@angular/platform-browser";
import { browserTracingIntegration, init } from "@sentry/angular";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";
import { environment } from "./environments/environment";

init({
  dsn: "https://5763d54cb1a94026a63c3507feaa793a@glitchtip.jlavocat.eu/1",
  environment: "production",
  release: "1.0.0",
  tracesSampleRate: 0.1,
  integrations: [browserTracingIntegration({})],
  enabled: environment.enableSentry,
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);

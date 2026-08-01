{
  description = "StdbAdmin — Angular admin dashboard for SpacetimeDB";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
  flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };

      # This repo is a pure Angular 19 SPA (see package.json / angular.json).
      # Node 22 matches the Volta pin (22.14.x) and the Dockerfile (node:22).
      # Angular CLI, TypeScript, Tailwind, PrimeNG, Monaco, etc. all come from
      # npm — only the Node runtime + package manager need to be on PATH.
      commonPackages = with pkgs; [
        nodejs_22 # node + npm
        git
        # CA bundle so Node/npm (and curl) can verify HTTPS (registry.npmjs.org, etc.)
        cacert
        # Useful for probing SpacetimeDB HTTP APIs while developing the admin UI.
        curl
        jq
      ];

      # SSL cert env needed by Node/npm when cacert isn't the system default
      # (common in pure Nix shells and jailed agent sandboxes).
      commonEnv = {
        SSL_CERT_FILE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
        NODE_EXTRA_CA_CERTS = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
        CURL_CA_BUNDLE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
      };
    in
    {
      devShells.default = pkgs.mkShell ({
        packages = commonPackages;

        shellHook = ''
          echo "StdbAdmin dev shell"
          echo "  node $(node --version) / npm $(npm --version)"
          echo ""
          echo "First time / after lockfile changes:"
          echo "  npm ci"
          echo ""
          echo "Dev server (http://localhost:4200):"
          echo "  npm start"
          echo ""
          echo "Production build:"
          echo "  npm run build"
        '';
      } // commonEnv);

      # Agent shell: same toolchain so jailed agents can install, build, and serve.
      # Env attrs are forwarded into the jail (shellHook is not).
      devShells.agent = pkgs.mkShell ({
        packages = commonPackages;
      } // commonEnv);
    });
}

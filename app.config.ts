/// <reference types="node" />
import { execSync } from 'node:child_process';
import type { ConfigContext, ExpoConfig } from 'expo/config';

function obterHashDoCommit(): string {
  const informado = process.env.EXPO_PUBLIC_COMMIT_HASH?.trim();
  if (informado) {
    return informado;
  }

  const doEasBuild = process.env.EAS_BUILD_GIT_COMMIT_HASH?.trim();
  if (doEasBuild) {
    return doEasBuild.slice(0, 7);
  }

  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'indisponível';
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Valence',
  slug: config.slug ?? 'valence-mobile',
  extra: {
    ...config.extra,
    commitHash: obterHashDoCommit(),
  },
});

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 모노레포 프로젝트 루트 경로 탐색
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. 모노레포 상위 디렉토리 및 packages/shared-types 파일 감시(watch) 설정
config.watchFolders = [monorepoRoot];

// 2. pnpm 심볼릭 링크 패키지 해석 경로 우선순위 설정
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. 심볼릭 링크 해석 허용
config.resolver.disableHierarchicalLookup = false;

module.exports = config;

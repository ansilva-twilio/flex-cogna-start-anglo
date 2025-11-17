import { FeatureDefinition } from '../../types/feature-loader';
import { isFeatureEnabled } from './config';
// @ts-ignore
import hooks from './flex-hooks/**/*.*';

console.log('🔍 [DEBUG] conversation-stories index.ts foi carregado!');
console.log('🔍 [DEBUG] isFeatureEnabled():', isFeatureEnabled());
console.log('🔍 [DEBUG] hooks:', hooks);

export const register = (): FeatureDefinition => {
  console.log('🔍 [DEBUG] register() foi chamado!');
  if (!isFeatureEnabled()) {
    console.log('🔍 [DEBUG] Feature desabilitada, retornando vazio');
    return {};
  }
  console.log('🔍 [DEBUG] Feature habilitada, registrando hooks');
  return { name: 'conversation-stories', hooks: typeof hooks === 'undefined' ? [] : hooks };
};

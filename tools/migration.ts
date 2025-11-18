/**
 * Migration Tools
 * Help migrate from other state management libraries
 */

/**
 * Migrates Redux code to Pulse
 */
export function migrateFromRedux(reduxCode: string): string {
  let migrated = reduxCode;

  // Replace Redux patterns with Pulse
  migrated = migrated.replace(
    /const\s+(\w+)\s*=\s*useSelector\(/g,
    'const $1 = useSignal('
  );
  migrated = migrated.replace(/dispatch\(/g, 'signal.dispatch(');
  migrated = migrated.replace(/createStore\(/g, 'reducerSignal(');

  return migrated;
}

/**
 * Migrates MobX code to Pulse
 */
export function migrateFromMobX(mobxCode: string): string {
  let migrated = mobxCode;

  migrated = migrated.replace(/observable\(/g, 'signal(');
  migrated = migrated.replace(/computed\(/g, 'computed(');
  migrated = migrated.replace(/autorun\(/g, 'effect(');
  migrated = migrated.replace(/action\(/g, 'batch(() =>');

  return migrated;
}

/**
 * Migrates Vue 3 code to Pulse
 */
export function migrateFromVue(vueCode: string): string {
  let migrated = vueCode;

  migrated = migrated.replace(/ref\(/g, 'signal(');
  migrated = migrated.replace(/computed\(/g, 'computed(');
  migrated = migrated.replace(/watch\(/g, 'effect(');
  migrated = migrated.replace(/\.value/g, '()');

  return migrated;
}

/**
 * Migrates Svelte stores to Pulse
 */
export function migrateFromSvelte(svelteCode: string): string {
  let migrated = svelteCode;

  migrated = migrated.replace(/writable\(/g, 'signal(');
  migrated = migrated.replace(/readable\(/g, 'signal(');
  migrated = migrated.replace(/\$:/g, 'computed(() =>');
  migrated = migrated.replace(/\$(\w+)/g, '$1()');

  return migrated;
}

/**
 * Detects which library code is from
 */
export function detectLibrary(code: string): 'redux' | 'mobx' | 'vue' | 'svelte' | 'unknown' {
  if (code.includes('useSelector') || code.includes('createStore')) {
    return 'redux';
  }
  if (code.includes('observable') || code.includes('autorun')) {
    return 'mobx';
  }
  if (code.includes('ref(') || code.includes('computed(') && code.includes('setup(')) {
    return 'vue';
  }
  if (code.includes('writable') || code.includes('$:')) {
    return 'svelte';
  }
  return 'unknown';
}

/**
 * Auto-migrates code
 */
export function autoMigrate(code: string): string {
  const library = detectLibrary(code);
  
  switch (library) {
    case 'redux':
      return migrateFromRedux(code);
    case 'mobx':
      return migrateFromMobX(code);
    case 'vue':
      return migrateFromVue(code);
    case 'svelte':
      return migrateFromSvelte(code);
    default:
      return code;
  }
}


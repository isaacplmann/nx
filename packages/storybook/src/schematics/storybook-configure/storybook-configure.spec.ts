import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { runSchematic, createTestUILib } from '../../utils/testing';
import { readJsonInTree } from '@nrwl/workspace';
import { join, normalize, schema } from '@angular-devkit/core';
import {
  babelCoreVersion,
  storybookAddonKnobsVersion,
  storybookAngularVersion,
  babelLoaderVersion
} from '../../utils/versions';
import { Architect, targetFromTargetString } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import * as path from 'path';
import { StorybookConfigureSchema } from './schema';

describe('schematic:storybook-configure', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = await createTestUILib();
  });

  it('should generate files', async () => {
    const tree = await runSchematic(
      'storybook-configure',
      { name: 'test-ui-lib' },
      appTree
    );

    expect(tree.exists('libs/test-ui-lib/.storybook/addons.js')).toBeTruthy();
    expect(tree.exists('libs/test-ui-lib/.storybook/config.js')).toBeTruthy();
    expect(
      tree.exists('libs/test-ui-lib/.storybook/tsconfig.json')
    ).toBeTruthy();
  });

  it('should update `angular.json` file', async () => {
    const tree = await runSchematic(
      'storybook-configure',
      { name: 'test-ui-lib' },
      appTree
    );
    const angularJson = readJsonInTree(tree, 'angular.json');
    const project = angularJson.projects['test-ui-lib'];

    expect(project.architect.storybook).toEqual({
      builder: '@nrwl/workspace:run-commands',
      options: {
        readyWhen: 'http://localhost:4400',
        commands: [
          {
            command:
              'npx start-storybook -c libs/test-ui-lib/.storybook -p 4400'
          }
        ]
      },
      configurations: {
        ci: {
          commands: [
            {
              command:
                'npx start-storybook -c libs/test-ui-lib/.storybook -p 4400 --ci --quiet'
            }
          ]
        }
      }
    });
  });

  it('should update `tsconfig.lib.json` file', async () => {
    const tree = await runSchematic(
      'storybook-configure',
      { name: 'test-ui-lib' },
      appTree
    );
    const tsconfigLibJson = readJsonInTree(
      tree,
      'libs/test-ui-lib/tsconfig.lib.json'
    );
    expect(tsconfigLibJson.exclude.includes('**/*.stories.ts')).toBeTruthy();
  });

  it('should configure everything at once', async () => {
    const tree = await runSchematic(
      'storybook-configure',
      <StorybookConfigureSchema>{
        name: 'test-ui-lib',
        configureCypress: true,
        generateCypressSpecs: true,
        generateStories: true
      },
      appTree
    );
    expect(tree.exists('libs/test-ui-lib/.storybook/addons.js')).toBeTruthy();
    expect(tree.exists('libs/test-ui-lib/.storybook/config.js')).toBeTruthy();
    expect(
      tree.exists('libs/test-ui-lib/.storybook/tsconfig.json')
    ).toBeTruthy();
    expect(tree.exists('apps/test-ui-lib-e2e/cypress.json')).toBeTruthy();
    expect(
      tree.exists(
        'libs/test-ui-lib/src/lib/test-button/test-button.component.stories.ts'
      )
    ).toBeTruthy();
    expect(
      tree.exists(
        'libs/test-ui-lib/src/lib/test-other/test-other.component.stories.ts'
      )
    ).toBeTruthy();
    expect(
      tree.exists(
        'apps/test-ui-lib-e2e/src/integration/test-button/test-button.component.spec.ts'
      )
    ).toBeTruthy();
    expect(
      tree.exists(
        'apps/test-ui-lib-e2e/src/integration/test-other/test-other.component.spec.ts'
      )
    ).toBeTruthy();
  });

  it('should run twice without errors', async () => {
    let tree = await runSchematic(
      'storybook-configure',
      <StorybookConfigureSchema>{
        name: 'test-ui-lib',
        configureCypress: true,
        generateCypressSpecs: true,
        generateStories: true
      },
      appTree
    );
    tree = await runSchematic(
      'storybook-configure',
      <StorybookConfigureSchema>{
        name: 'test-ui-lib',
        configureCypress: true,
        generateCypressSpecs: true,
        generateStories: true
      },
      appTree
    );
  });

  // it('should launch cypress and storybook successfully', async done => {
  //   const tree = await runSchematic(
  //     'storybook-configure',
  //     <StorybookConfigureSchema>{
  //       name: 'test-ui-lib',
  //       configureCypress: true,
  //       generateCypressSpecs: true,
  //       generateStories: true
  //     },
  //     appTree
  //   );
  //   const registry = new schema.CoreSchemaRegistry();
  //   registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  //   const testArchitectHost = new TestingArchitectHost('/root', '/root');

  //   const architect = new Architect(testArchitectHost, registry);
  //   await testArchitectHost.addBuilderFromPackage(
  //     path.join(__dirname, '../../..')
  //   );
  //   const run = await architect.scheduleTarget(
  //     targetFromTargetString('test-ui-lib-e2e:e2e')
  //   );
  //   expect(await run.result).toEqual(
  //     jasmine.objectContaining({
  //       success: true
  //     })
  //   );
  //   done();
  // });
});

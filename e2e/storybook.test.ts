import {
  createTestUILib,
  forEachCli,
  runCLI,
  supportUi,
  newProject,
  runYarnInstall
} from './utils';

forEachCli(() => {
  describe('Storybook schematics', () => {
    if (supportUi()) {
      describe('running Storybook and Cypress', () => {
        it('should execute e2e tests using Cypress running against Storybook', () => {
          newProject();
          createTestUILib();
          const mylib = 'test-ui-lib';

          runCLI(
            `generate @nrwl/storybook:configuration ${mylib} --configureCypress --generateStories --generateCypressSpecs --noInteractive`
          );
          runYarnInstall();

          expect(
            runCLI(`run ${mylib}-e2e:e2e --configuration=headless`)
          ).toContain('All specs passed!');
        }, 1000000);
      });
    }
  });
});

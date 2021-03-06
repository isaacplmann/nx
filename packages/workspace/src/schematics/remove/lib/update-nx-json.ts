import { NxJson, updateJsonInTree } from '@nrwl/workspace';
import { Schema } from '../schema';

/**
 * Updates the nx.json file to remove the project
 *
 * @param schema The options provided to the schematic
 */
export function updateNxJson(schema: Schema) {
  return updateJsonInTree<NxJson>('nx.json', json => {
    delete json.projects[schema.projectName];
    return json;
  });
}

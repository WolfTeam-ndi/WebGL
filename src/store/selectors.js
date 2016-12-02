import { createSelector } from 'reselect';
import { Vector3 } from 'three';

export const selectRepositories = state => state && state.repositories;

export const selectRepo = repo => createSelector(
	selectRepositories,
	repos => repos && repos[repo]
);

export const selectBranch = (repo, branch) => createSelector(
	selectRepo(repo),
	repo => repo && repo[branch]
);

// Selections
export const selectSelections = state => state && state.selection;

export const selectRepositorySelection = createSelector(
	selectSelections,
	selections => selections && selections.repository
);

export const selectBranchSelection = createSelector(
	selectSelections,
	selections => selections && selections.branch
);

export const selectPipelineSelection = createSelector(
	selectSelections,
	selections => selections && selections.pipeline
);

// Select current ...
export const selectCurrentRepository = createSelector(
	selectRepositorySelection,
	selectRepositories,
	(current, repos) => repos && repos[current]
);

export const selectCurrentBranch = createSelector(
	selectBranchSelection,
	selectCurrentRepository,
	(current, branches) => branches && branches[current]
);

// Select viewport related coords
export const selectViewport = state => state.viewport;

export const selectLookAt = createSelector(
	selectViewport,
	viewport => new Vector3(0, viewport.height-10, 0)
);

const DISTANCE = 30;

export const selectCameraPosition = createSelector(
	selectViewport,
	viewport => new Vector3(DISTANCE * Math.sin(viewport.rotation), viewport.height, DISTANCE * Math.cos(viewport.rotation))
);

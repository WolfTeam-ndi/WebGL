import { createSelector } from 'reselect';

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

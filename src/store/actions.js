import { selectBranch } from './selectors';
import { getNetworkUrl } from '../urls';

const fetchNetwork = (repo, branch) => fetch(getNetworkUrl(repo, branch))
	.then(r => r.json())

export const selectRepo = (repository, branch = 'master') => {
	return (dispatch, getState) => {
		if (!selectBranch(repository, branch)(getState())) {
			fetchNetwork(repository, branch)
				.then(data => dispatch({
					type: 'NETWORK_LOADED',
					repository,
					branch,
					data,
				}));
		}

		dispatch({
			type: 'CHANGE_SELECTION',
			selection: {
				repository,
				branch,
				pipeline: null,
			},
		});
	}
}

export const initialState = {
	pipelines: {},
	repositories: {},
	selection: {
		repository: null,
		branch: null,
		pipeline: null,
	},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'NETWORK_LOADED':
			return {
				...state,
				repositories: {
					...state.repositories,
					[action.repository]: {
						...state.repositories[action.repository],
						[action.branch]: action.data,
					}
				}
			};

		case 'CHANGE_SELECTION':
			return {
				...state,
				selection: action.selection,
			};
	}
};

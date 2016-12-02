export const initialState = {
	pipelines: {},
	repositories: {},
	selection: {
		repository: null,
		branch: null,
		pipeline: null,
	},
	viewport: {
		rotation: 0,
		height: 0,
	}
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

		case 'ROTATE_VIEWPORT':
			return {
				...state,
				viewport: {
					...state.viewport,
					rotation: (state.viewport.rotation + action.delta) % Math.PI,
				}
			};


		case 'MOVE_VIEWPORT':
			return {
				...state,
				viewport: {
					...state.viewport,
					height: Math.max(0, state.viewport.height + action.delta),
				}
			};
	}
};

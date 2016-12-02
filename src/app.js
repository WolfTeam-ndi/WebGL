import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

import store from './store';
import { selectCurrentBranch } from './store/selectors';
import { selectRepo } from './store/actions';

store.subscribe(() => console.log(selectCurrentBranch(store.getState())));
store.dispatch(selectRepo('gitlab-org/gitlab-ci-multi-runner'));

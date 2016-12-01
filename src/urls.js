const PROXY_API = 'https://gl-ndi.aius.u-strasbg.fr';

export const getNetworkUrl = (repo, branch = 'master') => `${PROXY_API}/${repo}/network/${branch}?format=json`;

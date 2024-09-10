export async function getFtWebsocket() {
    const ftApi = await import('futu-api');
    return ftApi.default;
  }
  
  export async function getCommon() {
    const {default: Common} = await import('futu-api/proto');
    return Common.root.toJSON();
  }
  
  export async function getTrd_Common() {
    const { default: Trd_Common } = await import('futu-api/proto');
    return Trd_Common.root.toJSON();
  }
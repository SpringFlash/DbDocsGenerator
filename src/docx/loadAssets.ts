export interface ReportAssets {
  topSecret: ArrayBuffer;
  divider: ArrayBuffer;
  sealed: ArrayBuffer;
  lspdLogo: ArrayBuffer;
}

export async function loadAssets(): Promise<ReportAssets> {
  const basePath = import.meta.env.BASE_URL + "assets/";

  const [topSecret, divider, sealed, lspdLogo] = await Promise.all([
    fetch(basePath + "image1.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image2.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image3.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image4.png").then((r) => r.arrayBuffer()),
  ]);

  return { topSecret, divider, sealed, lspdLogo };
}

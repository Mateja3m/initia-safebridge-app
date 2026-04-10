import { NextResponse } from 'next/server';
import { bridgeOptions } from '../../../lib/appConfig';
import { getRoutableDestinationRollups } from '../../../lib/liveCatalog';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') || bridgeOptions.assets[0];
    const destinationRollups = await getRoutableDestinationRollups(asset);

    return NextResponse.json({
      sourceNetworks: bridgeOptions.sourceNetworks,
      assets: bridgeOptions.assets,
      destinationRollups: destinationRollups.map((rollup) => rollup.label),
      asset,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error?.message || 'Unable to load live rollup catalog.',
      },
      { status: 500 }
    );
  }
}

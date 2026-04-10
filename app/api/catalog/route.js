import { NextResponse } from 'next/server';
import { bridgeOptions } from '../../../lib/appConfig';
import { getLiveDestinationRollups } from '../../../lib/liveCatalog';

export async function GET() {
  try {
    const destinationRollups = await getLiveDestinationRollups();

    return NextResponse.json({
      sourceNetworks: bridgeOptions.sourceNetworks,
      assets: bridgeOptions.assets,
      destinationRollups: destinationRollups.map((rollup) => rollup.label),
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

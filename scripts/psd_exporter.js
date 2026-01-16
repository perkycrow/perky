import {readFile} from 'fs/promises';
import {basename, dirname, join} from 'path';
import Psd from '@webtoon/psd';
import sharp from 'sharp';


async function exportPsd(psdPath) {
    const buffer = await readFile(psdPath);
    const psd = Psd.parse(buffer.buffer);

    const psdName = basename(psdPath, '.psd');
    const outputDir = dirname(psdPath);

    const animGroups = psd.children.filter(child => {
        return child.type === 'Group' && child.name.startsWith('anim - ');
    });

    if (animGroups.length === 0) {
        console.log('No animation groups found (looking for "anim - " prefix)');
        return;
    }

    console.log(`Found ${animGroups.length} animation group(s)`);

    for (const group of animGroups) {
        const animName = group.name.replace('anim - ', '');
        console.log(`\nProcessing: ${group.name}`);

        for (const layer of group.children) {
            if (layer.type !== 'Layer') continue;

            const frameMatch = layer.name.match(/^(\d+)\s*-/);
            if (!frameMatch) {
                console.log(`  Skipping "${layer.name}" (no frame number)`);
                continue;
            }

            const frameNumber = frameMatch[1];
            const outputName = `${psdName}_${animName}_${frameNumber}.png`;
            const outputPath = join(outputDir, outputName);

            const pixels = await layer.composite(false);
            const layerWidth = layer.width;
            const layerHeight = layer.height;

            await sharp(Buffer.from(pixels.buffer), {
                raw: {
                    width: layerWidth,
                    height: layerHeight,
                    channels: 4
                }
            })
                .extend({
                    top: layer.top,
                    left: layer.left,
                    bottom: psd.height - layer.top - layerHeight,
                    right: psd.width - layer.left - layerWidth,
                    background: {r: 0, g: 0, b: 0, alpha: 0}
                })
                .toColorspace('srgb')
                .png()
                .toFile(outputPath);

            console.log(`  Exported: ${outputName}`);
        }
    }

    console.log('\nDone!');
}


const psdPath = process.argv[2];

if (!psdPath) {
    console.log('Usage: node scripts/psd_exporter.js <path-to-psd>');
    process.exit(1);
}

exportPsd(psdPath).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});

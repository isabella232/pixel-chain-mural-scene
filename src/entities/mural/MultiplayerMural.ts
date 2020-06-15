import { MURAL_SIZE, START_SWATCH } from "../../Config"
import { Mural, TilePosition } from "./Mural"
import { Tile } from "./Tile"
import { shuffleArray } from "../../Utils"
import { MultiplayerEntity } from "../MultiplayerEntity"
import { SwatchIndex } from "../palette/MultiplayerPalette"
import { Materials } from "../Materials"

// A mural than can be shared with other players
export class MultiplayerMural extends MultiplayerEntity<TilePosition, SwatchIndex, string> {

    constructor() {
        super('mural')
    }

    private colorMural: Mural<SwatchIndex>
    private entityMural: Mural<Tile>

    protected runInitialLoad(): void {
        this.entityMural = Mural.initializeEmpty(MURAL_SIZE, MURAL_SIZE, (position) => {
            const tile = new Tile(position, (index) => this.changeEntity(position, index))
            tile.setParent(this)
            return tile
        })
    }

    protected getFullStateDefaults(): string {
        return Mural.initializeEmpty(MURAL_SIZE, MURAL_SIZE, () => START_SWATCH).toJson()
    }

    protected initializeWithFullState(fullState: string): void {
        this.colorMural = Mural.fromJSON<SwatchIndex>(fullState)

        // Set the colors on the mural
        this.colorMural.getAllTiles()
            .forEach(({ pos, value: idx }) => {
                const color = Materials.getForIndex(idx)
                this.entityMural.getTile(pos).setIndex(idx)
            })
    }

    protected getFullStateToShare(): string {
        return this.colorMural?.toJson()
    }

    protected setAsVisible(): void {
        const tiles = shuffleArray(this.entityMural.getAllTiles());
        tiles.forEach(({ value: tile }) => tile.setVisible())
    }

    protected onChange(position: TilePosition, index: SwatchIndex): void {
        this.colorMural.setTile(position, index)
        this.entityMural.getTile(position).setIndex(index)
    }

}
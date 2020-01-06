namespace tileworld {

    const yoff = 6;

    let ruleEditor: RuleEditor = null;
    // TODO: menu
    export class RuleRoom extends RuleVisualsBase {
        constructor(p: Project, private kind: number) {
            super(p);
            this.update();
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                if (this.col() == 0 && this.row() == 0) {
                    ruleEditor = new RuleEditor(this.p, kind, -1, -1);
                } else {
                    let rt = this.ruleTypeMap.getPixel(this.col(), this.row());
                    let dir = this.dirMap.getPixel(this.col(), this.row());
                    if (rt != 0xf) {
                        game.pushScene();
                        ruleEditor = new RuleEditor(this.p, kind, rt, dir);
                    }
                }
            });
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                game.popScene();
                ruleEditor = null;
            });
        }

        public update() {
            screen.fill(15);
            screen.fillRect(0, yoff, 16, 16, 11);
            screen.drawTransparentImage(pencil, 0, yoff)
            this.showRuleMenu(1, 0);
        }

        protected centerImage() {
            return this.p.getImage(this.kind);
        }

        private makeContext(col: number, row: number) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.drawImage(col+i, row+j, emptyTile);
                }
            }
        }

        private setRuleType(rt: RuleType, rd: MoveDirection, col: number, row: number) {
            this.ruleTypeMap.setPixel(col, row, rt);
            this.dirMap.setPixel(col, row, rd);
        }

        private rules: number[];
        private doBoth(rt: RuleType, rd: MoveDirection, col: number, row: number, center: boolean = true) {
            let scol = 13;
            let rules = this.getRulesForTypeDir(this.rules, rt, rd);
            if (rt >= RuleType.CollidingResting) {
                let tcol = col + moveXdelta(rd);
                let trow = row + moveYdelta(rd);
                this.setRuleType(rt, rd, tcol, trow);
                if (rules.length > 0) { this.fillTile(tcol, trow, scol); this.drawOutline(tcol,trow, 1); }
            } else if (rt == RuleType.Pushing) {
                let tcol = col - moveXdelta(rd);
                let trow = row - moveYdelta(rd);
                this.setRuleType(rt, rd, tcol, trow);
                if (rules.length > 0) { this.fillTile(tcol, trow, scol); this.drawOutline(tcol, trow, 1); }
            } else {
                this.setRuleType(rt, rd, col, row);
                if (rules.length > 0) { this.fillTile(col, row, scol); this.drawOutline(col, row, 1); }
            }
            this.showRuleType(rt, rd, col, row, center);
        }

        private showRuleMenu(x: number, y: number) {
            this.rules = this.p.getRulesForKind(this.kind);
            this.makeContext(x + 2, y + 1)
            this.doBoth(RuleType.Resting, 0, x + 2, y + 1);

            // if (this.kind < this.p.fixed().length)
            //    return;

            //this.makeContext(x + 6, y + 1)
            this.doBoth(RuleType.Moving, MoveDirection.Right, x + 3, y + 1);
            this.doBoth(RuleType.Moving, MoveDirection.Left, x + 1, y + 1);
            this.doBoth(RuleType.Moving, MoveDirection.Up, x + 2, y);
            this.doBoth(RuleType.Moving, MoveDirection.Down, x+2, y+2);

            this.makeContext(x + 6, y + 1)
            this.doBoth(RuleType.Pushing, MoveDirection.Right, x + 8, y + 1, false);
            this.doBoth(RuleType.Pushing, MoveDirection.Left, x + 4, y + 1, false);
            this.doBoth(RuleType.Pushing, MoveDirection.Down, x + 6, y + 3, false);
            this.doBoth(RuleType.Pushing, MoveDirection.Up, x + 6, y - 1, false);

            this.makeContext(x + 2, y + 5);

            this.makeContext(x + 6, y + 5);
            this.doBoth(RuleType.CollidingMoving, MoveDirection.Right, x + 6, y + 5, false);
            this.doBoth(RuleType.CollidingMoving, MoveDirection.Left, x + 6, y + 5, false);
            this.doBoth(RuleType.CollidingMoving, MoveDirection.Up, x + 6, y + 5, false);
            this.doBoth(RuleType.CollidingMoving, MoveDirection.Down, x + 6, y + 5, false);
            this.showRuleType(RuleType.Resting, 0, x + 6, y + 5);
        }
    }
}
Crafty.extend({
    /**@
* #Crafty.isometric
* @category 2D
* Place entities in a 45deg isometric fashion.
*/
    isometric: {
        _tile: {
            width: 0,
            height: 0
        },
        _z: 0,
        /**@
* #Crafty.isometric.size
* @comp Crafty.isometric
* @sign public this Crafty.isometric.size(Number tileSize)
* @param tileSize - The size of the tiles to place.
* Method used to initialize the size of the isometric placement.
* Recommended to use a size alues in the power of `2` (128, 64 or 32).
* This makes it easy to calculate positions and implement zooming.
* ~~~
* var iso = Crafty.isometric.size(128);
* ~~~
* @see Crafty.isometric.place
*/
        size: function (width, height) {
            this._tile.width = width;
            this._tile.height = height > 0 ? height : width/2; //Setup width/2 if height doesnt set
            return this;
        },
        /**@
    * #Crafty.isometric.place
    * @comp Crafty.isometric
    * @sign public this Crafty.isometric.size(Number x, Number y, Number z, Entity tile)
    * @param x - The `x` position to place the tile
    * @param y - The `y` position to place the tile
    * @param z - The `z` position or height to place the tile
    * @param tile - The entity that should be position in the isometric fashion
    * Use this method to place an entity in an isometric grid.
    * ~~~
    * var iso = Crafty.isometric.size(128);
    * isos.place(2, 1, 0, Crafty.e('2D, DOM, Color').color('red').attr({w:128, h:128}));
    * ~~~
    * @see Crafty.isometric.size
    */
        place: function (x, y, z, obj) {
            var pos = this.pos2px(x,y);
            obj.attr({
                x: pos.left + Crafty.viewport._x, 
                y: pos.top + Crafty.viewport._y
            }).z += z;
            return this;
        },
        /**@
         * #Crafty.isometric.pos2px
         * @comp Crafty.isometric
         * @sign public this Crafty.isometric.pos2px(Number x,Number y)
         * @param x 
         * @param y
         * @return Object {left Number,top Number}
         * This method calculate the X and Y Coordiantes to Pixel Positions
         * ~~~
         * var iso = Crafty.isometric.size(128,96);
         * var position = iso.pos2px(100,100);
         * console.log(position); //Object { left=12800, top=4800}
         * ~~~
         */
        pos2px:function(x,y){
            return {
                left:x * this._tile.width + (y & 1) * (this._tile.width / 2),
                top:y * this._tile.height / 2 
            }
        },
         /**@
         * #Crafty.isometric.px2pos
         * @comp Crafty.isometric
         * @sign public this Crafty.isometric.px2pos(Number left,Number top)
         * @param top 
         * @param left
         * @return Object {x Number,y Number}
         * This method calculate pixel top,left positions to x,y coordiantes
         * ~~~
         * var iso = Crafty.isometric.size(128,96);
         * var px = iso.pos2px(12800,4800);
         * console.log(px); //Object { x=-100, y=-100}
         * ~~~
         */
        px2pos:function(left,top){
            return {
                x:Math.ceil(-left / this._tile.width - (top & 1)*0.5),
                y:-top / this._tile.height * 2
            }; 
        },
          /**@
         * #Crafty.isometric.centerAt
         * @comp Crafty.isometric
         * @sign public this Crafty.isometric.centerAt(Number x,Number y)
         * @param top 
         * @param left
         * This method center the Viewport at x/y location or gives the current centerpoint of the viewport
         * ~~~
         * var iso = Crafty.isometric.size(128,96).centerAt(10,10); //Viewport is now moved
         * //After moving the viewport by another event you can get the new center point
         * console.log(iso.centerAt());
         * ~~~
         */
        centerAt:function(x,y){   
            if(typeof x == "number" && typeof y == "number"){
                var center = this.pos2px(x,y);
                Crafty.viewport._x = -center.left+Crafty.viewport.width/2-this._tile.width/2;
                Crafty.viewport._y = -center.top+Crafty.viewport.height/2-this._tile.height/2;
                return this;
            }else{
                return {
                    top:-Crafty.viewport._y+Crafty.viewport.height/2-this._tile.height/2,
                    left:-Crafty.viewport._x+Crafty.viewport.width/2-this._tile.width/2
                } 
            }
        },
          /**@
         * #Crafty.isometric.area
         * @comp Crafty.isometric
         * @sign public this Crafty.isometric.area()
         * @return Object {x:{start Number,end Number},y:{start Number,end Number}}
         * This method get the Area surounding by the centerpoint depends on viewport height and width
         * ~~~
         * var iso = Crafty.isometric.size(128,96).centerAt(10,10); //Viewport is now moved
         * var area = iso.area(); //get the area
         *for(var y = area.y.start;y <= area.y.end;y++){
         *for(var x = area.x.start ;x <= area.x.end;x++){
         *       iso.place(x,y,0,Crafty.e("2D,DOM,gras")); //Display tiles in the Screen
         *   }
         *}  
         * ~~~
         */
        area:function(){
            //Get the center Point in the viewport
            var center = this.centerAt();
            var start = this.px2pos(-center.left+Crafty.viewport.width/2,-center.top+Crafty.viewport.height/2);
            var end = this.px2pos(-center.left-Crafty.viewport.width/2,-center.top-Crafty.viewport.height/2);
            return {
                x:{
                    start : start.x,
                    end : end.x
                },
                y:{
                    start : start.y,
                    end : end.y
                }
            };
        },
        /**@
         * #Crafty.isometric.slice
         * @comp Crafty.isometric
         * @sign public this Crafty.isometric.slice()
         * Method to slice Entities into Parts depends on tile width/height and setup different z-index
         * ~~~
         * var iso = Crafty.isometric.size(128,96).centerAt(10,10); //Viewport is now moved
         * iso.slice(10,10,Crafty.e("2D, DOM, building"));
         * ~~~
         */
        slice:function(x,y,ent){
        ent.destroy(); //Undraw original
        var clone = {};
        for(var _y = 0;_y < ent._h / this._tile.height*2;_y++){
            for(var _x = 0;_x < ent._w /this._tile.width;_x++){
                if((y+_y) & 1){
                clone = ent.clone();
                clone.crop(_x*this._tile.width,_y*this._tile.height/2,this._tile.width,this._tile.height);
                this.place((x+_x),(y+_y),((x+_x)+1)*((y+_y)+1),clone);
                }
            }
        }
        }
    }
});

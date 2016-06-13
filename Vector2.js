var Vector2 = function ()
{
	this.x = 0;
	this.y = 0;
};

Vector2.prototype.set = function(x, y)
{
	this.x = x;
	this.y = y;
};

Vector2.prototype.copy = function()
{
	
};

Vector2.prototype.zero = function()
{
	
};

Vector2.prototype.normalize = function()
{
	var mag = Math.sqrt(x * x + y * y);
	
	if (mag === 0) {
		x = 0;
		y = 0;
	}else{
		x = x / mag;
		y = y / mag;
	}
};

Vector2.prototype.add = function()
{
	return new Vector2(x + vector.x, y + vector.y);
};

Vector2.prototype.subtract = function()
{
	return new Vector2(x - vector.x, y - vector.y);
};

Vector2.prototype.multiplyScalar = function()
{
	
}


(function() {

	//Node object
	function Node(point, parent) {
		//Point is a object, e.g:
		// {
		// 	 x: 25,
		// 	 y: 15
		// }
		this.point = point;
		this.parent = parent;
		this.left = null;
		this.right = null;
		

		this.isLeaf = function () {
			return this.left === null && this.right === null;
		}

		this.isRoot = function () {
			return this.parent = null;
		}
	}

	//KDTree object, Dimension array must list all
	function KDTree(points, dimension_array) {

		//build function
		function build(points, depth, parent) {
			if(points.length === 0) {
				return null;
			}

			if(points.length === 1) {
				return new Node(points[0], parent);
			}

			var axis = dimension_array[depth % dimension_array.length];

			points.sort(function (point1, point2) {
				return point1[axis] - point2[axis];
			});

			var median = Math.floor(points.length / 2);

			var node = new Node(points[median], null);
			
			node.left = build(points.slice(0, median), depth + 1, node);
			node.right = build(points.slice(median + 1), depth + 1, node);

			return node;
		}

		//Build new tree from points
		this.root = build(points, 0, null);

		this.nearest = function(searched_point) {

			//Distance function
			function distance(point1, point2) {
				var distance = 0;

				dimension_array.forEach(function (dimension) {
					distance += Math.pow(point1[dimension] - point2[dimension],2);
				});

				return distance;
			}

			var current = null;
			function search (node, searched_point, depth) {
				if(node === null) {
					return;
				}

				if(node.isLeaf()) {
					if(current === null) {
						current = node;
					} else if(distance(node.point, searched_point) < distance(current.point, searched_point)) {
						current = node;
					}
					return;
				}

				var closer = null;
				var further = null;

				var axis = dimension_array[depth % dimension_array.length];

				if(searched_point[axis] < node.point[axis]) {
					closer = node.left;
					further = node.right;
				} else {
					closer = node.right;
					further = node.left;
				}

				search(closer, searched_point, depth + 1);

				if(distance(node.point, searched_point) < distance(current.point, searched_point)) {
					current = node;
				}

				if(Math.pow(node.point[axis] - searched_point[axis], 2) < distance(current.point, searched_point)) {
					search(further, searched_point, depth + 1);
				}
			}

			var result;
			if(typeof this.root === "undefined") {
				result = undefined;
			} else {
				search(this.root, searched_point, 0);
				result = {
					point: current.point,
					distance: Math.sqrt(distance(searched_point, current.point))
				}
			}

			return result;
		}
	}

	window.KDTree = KDTree;
})();
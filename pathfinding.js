/**
 * Pathfinding Module for AIGame
 * Provides A* pathfinding algorithm and related utilities
 * Created: 2026-01-14 07:51:15 UTC
 */

class Node {
  constructor(x, y, walkable = true) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    this.g = 0; // Cost from start node
    this.h = 0; // Heuristic cost to end node
    this.f = 0; // Total cost (g + h)
    this.parent = null;
  }

  getCost() {
    return this.f;
  }
}

class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.nodes = this._initializeGrid();
  }

  _initializeGrid() {
    const nodes = [];
    for (let y = 0; y < this.height; y++) {
      nodes[y] = [];
      for (let x = 0; x < this.width; x++) {
        nodes[y][x] = new Node(x, y, true);
      }
    }
    return nodes;
  }

  getNode(x, y) {
    if (this._isWalkable(x, y)) {
      return this.nodes[y][x];
    }
    return null;
  }

  setWalkable(x, y, walkable) {
    if (this._isInBounds(x, y)) {
      this.nodes[y][x].walkable = walkable;
    }
  }

  _isWalkable(x, y) {
    return this._isInBounds(x, y) && this.nodes[y][x].walkable;
  }

  _isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getNeighbors(node, diagonal = false) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },  // North
      { x: 1, y: 0 },   // East
      { x: 0, y: 1 },   // South
      { x: -1, y: 0 }   // West
    ];

    if (diagonal) {
      directions.push(
        { x: 1, y: -1 },  // NE
        { x: 1, y: 1 },   // SE
        { x: -1, y: 1 },  // SW
        { x: -1, y: -1 }  // NW
      );
    }

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      const neighbor = this.getNode(newX, newY);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  reset() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const node = this.nodes[y][x];
        node.g = 0;
        node.h = 0;
        node.f = 0;
        node.parent = null;
      }
    }
  }
}

class Pathfinder {
  constructor(grid) {
    this.grid = grid;
  }

  /**
   * Find path using A* algorithm
   * @param {number} startX - Start X coordinate
   * @param {number} startY - Start Y coordinate
   * @param {number} endX - End X coordinate
   * @param {number} endY - End Y coordinate
   * @param {boolean} diagonal - Allow diagonal movement
   * @returns {Array} Array of coordinates representing the path
   */
  findPath(startX, startY, endX, endY, diagonal = false) {
    this.grid.reset();

    const startNode = this.grid.getNode(startX, startY);
    const endNode = this.grid.getNode(endX, endY);

    if (!startNode || !endNode) {
      return [];
    }

    const openSet = [startNode];
    const closedSet = new Set();

    startNode.g = 0;
    startNode.h = this._heuristic(startNode, endNode);
    startNode.f = startNode.h;

    while (openSet.length > 0) {
      let current = openSet[0];
      let currentIndex = 0;

      // Find node with lowest f cost
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      if (current === endNode) {
        return this._reconstructPath(endNode);
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(current);

      const neighbors = this.grid.getNeighbors(current, diagonal);

      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor)) {
          continue;
        }

        const tentativeG = current.g + 1;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeG >= neighbor.g) {
          continue;
        }

        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = this._heuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
      }
    }

    // No path found
    return [];
  }

  _heuristic(nodeA, nodeB) {
    // Manhattan distance
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
  }

  _reconstructPath(node) {
    const path = [];
    let current = node;

    while (current !== null) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }
}

// Export for use in Node.js or module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Node,
    Grid,
    Pathfinder
  };
}

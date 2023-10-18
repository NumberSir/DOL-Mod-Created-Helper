class Vertex:
    def __init__(self, key: int):
        self._key = key
        self._neighbour: set["Vertex"] = set()

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return f"{self.key}: [{self.neighbours}]"

    def add_neighbour(self, neighbour: "Vertex"):
        self._neighbour.add(neighbour)

    @property
    def neighbours(self):
        return self._neighbour

    @property
    def key(self):
        return self._key


class Graph:
    def __init__(self):
        self._vertexs: dict[int, "Vertex"] = {}
        self._length: int = 0

    def __contains__(self, key: int):
        return key in self._vertexs

    def __iter__(self):
        return iter(self._vertexs.values())

    def add_vertex(self, key: int):
        new_vertex = Vertex(key)
        self._vertexs[key] = new_vertex
        self._length += 1
        return new_vertex

    def get_vertex(self, key: int):
        return self._vertexs.get(key)

    def add_edge(self, from_: int, to_: int):
        if from_ not in self._vertexs:
            self.add_vertex(from_)
        if to_ not in self._vertexs:
            self.add_vertex(to_)
        self._vertexs[from_].add_neighbour(self._vertexs[to_])

    @property
    def vertexs(self):
        return self._vertexs

    @property
    def length(self):
        return self._length


def dfs(graph: "Graph", vertex: "Vertex", visited: list[int]):
    if vertex.key not in visited:
        visited.append(vertex.key)
        for neighbour in graph.vertexs[vertex.key].neighbours:
            if neighbour.key not in visited:
                dfs(graph, neighbour, visited)
        return visited


def main():
    graph = Graph()
    for i in range(6):
        graph.add_vertex(i)

    graph.add_edge(0, 1)
    graph.add_edge(0, 4)
    graph.add_edge(1, 3)
    graph.add_edge(1, 5)
    graph.add_edge(2, 4)
    graph.add_edge(2, 4)

    # for v in graph:
    #     for w in v.neighbours:
    #         print(f"({v.key} -> {w.key})")

    result = dfs(graph, Vertex(0), [])
    print(result)

if __name__ == '__main__':
    main()

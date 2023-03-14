package test.vectors;

import java.util.ArrayList;
import java.util.Scanner;

public class VectorSet {
    private int dimension;
    private ArrayList<Vector> vectors;

    public VectorSet(int dimension) {
        this.dimension = dimension;
        this.vectors = new ArrayList<>();
    }

    public void addVector(Vector vector) {
        if (vector.getDimension() != this.dimension) {
            throw new IllegalArgumentException("El vector debe tener la misma dimensión que los demás vectores en el conjunto.");
        }
        this.vectors.add(vector);
    }

    public void addVectorsFromConsole() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Ingrese la cantidad de vectores que desea agregar:");
        int numVectors = scanner.nextInt();
        for (int i = 0; i < numVectors; i++) {
            Vector vector = new Vector(this.dimension);
            vector.setComponentsFromConsole();
            addVector(vector);
        }
    }

    public void print() {
        for (Vector vector : this.vectors) {
            vector.print();
        }
    }

    public static void main(String[] args) {
        VectorSet vectorSet = new VectorSet(3);
        vectorSet.addVectorsFromConsole();
        vectorSet.print();
    }
}
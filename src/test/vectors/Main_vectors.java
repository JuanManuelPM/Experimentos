package test.vectors;

import java.util.Scanner;

public class Main_vectors {
    public static void main(String[] args) {
        VectorSet vectorSet = new VectorSet(4);
        vectorSet.addVectorsFromConsole();
        vectorSet.print();
        Vector vector = new Vector(4);
        vectorSet.addVector(vector);
        vectorSet.print();
    }
}

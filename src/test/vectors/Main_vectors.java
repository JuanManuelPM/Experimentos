package test.vectors;

import java.util.Scanner;

public class Main_vectors {
    public static void main(String[] args) {
        VectorSet vectorSet = new VectorSet(3);
        vectorSet.addVectorsFromConsole();
        vectorSet.print();
        System.out.println("¿el conjunto es linearmente independiente? (0/1): " + vectorSet.isLinearlyIndependent());
        Vector vector = new Vector(3);
        vectorSet.addVector(vector);
        vectorSet.print();
    }
}

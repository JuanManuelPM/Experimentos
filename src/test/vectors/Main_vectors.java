package test.vectors;

import java.util.Scanner;

public class Main_vectors {
    public static void main(String[] args) {

        VectorSet conjuntoDeVectores = new VectorSet(3);
        conjuntoDeVectores.fillWithGenericSet3d();

        conjuntoDeVectores.print();
        System.out.println("¿el conjunto es linearmente independiente? --> " + conjuntoDeVectores.isLinearlyIndependent());
        conjuntoDeVectores.removeVector(2);
        conjuntoDeVectores.print();
        //System.out.println("el conjunto de vectores extraibles es: ");
        //vectoresExtraibles.print();
        //Vector vector = new Vector(3);
        //vectorSet.addVector(vector);
        //vectorSet.print();

    }
}

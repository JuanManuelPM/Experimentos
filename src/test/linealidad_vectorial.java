package test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class linealidad_vectorial {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Pedir la dimensión de los vectores
        System.out.print("Ingrese la dimensión de los vectores: ");
        int dimension = scanner.nextInt();

        // Pedir la cantidad de vectores
        System.out.print("Ingrese la cantidad de vectores: ");
        int cantidad = scanner.nextInt();

        // Crear la matriz de vectores
        double[][] vectores = new double[cantidad][dimension];

        // Pedir los valores de los vectores
        System.out.println("Ingrese los valores de los vectores (separados por espacio):");
        for (int i = 0; i < cantidad; i++) {
            System.out.print("Vector " + (i+1) + ": ");
            for (int j = 0; j < dimension; j++) {
                vectores[i][j] = scanner.nextDouble();
            }
        }

        // Determinar si los vectores son linealmente independientes
        boolean independientes = true;
        for (int j = 0; j < dimension; j++) {
            // Aplicar eliminación gaussiana parcial
            for (int i = j+1; i < cantidad; i++) {
                double factor = vectores[i][j] / vectores[j][j];
                for (int k = j; k < dimension; k++) {
                    vectores[i][k] -= factor * vectores[j][k];
                }
            }

            // Verificar si la diagonal principal tiene ceros
            if (vectores[j][j] == 0) {
                independientes = false;
                break;
            }
        }

        // Imprimir el resultado
        if (independientes) {
            System.out.println("Los vectores son linealmente independientes.");
        } else {
            System.out.println("Los vectores son linealmente dependientes.");
        }

        scanner.close();
    }
}




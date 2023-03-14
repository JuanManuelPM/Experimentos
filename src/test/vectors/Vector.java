package test.vectors;

import java.util.Scanner;

public class Vector {
    private final int dimension;
    private double[] components;

    public Vector(int dimension) {
        this.dimension = dimension;
        this.components = new double[dimension];
    }

    public void setComponent(int index, double value) {
        this.components[index] = value;
    }

    public void setComponentsFromConsole() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Ingrese las componentes del vector separadas por espacios:");
        String[] componentsString = scanner.nextLine().split(" ");
        for (int i = 0; i < this.dimension; i++) {
            this.components[i] = Double.parseDouble(componentsString[i]);
        }
    }

    public void print() {
        System.out.print("[ ");
        for (int i = 0; i < this.dimension; i++) {
            System.out.print("(" + this.components[i] + ")");
            if(i+1 < this.dimension){
                System.out.print(" ; ");
            }else{
                System.out.println(" ]");
            }
        }
    }

    public static void main(String[] args) {
        Vector vector = new Vector(3);
        vector.setComponentsFromConsole();
        vector.print();
    }

    public int getDimension() {
        return dimension;
    }
}


package test.vectors;

import java.util.Scanner;
import java.text.DecimalFormat;

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

    public double getComponent(int index){ return this.components[index];}

    public void setComponentsFromConsole() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Ingrese las componentes del vector separadas por espacios:");
        String[] componentsString = scanner.nextLine().split(" ");
        for (int i = 0; i < this.dimension; i++) {
            this.components[i] = Double.parseDouble(componentsString[i]);
        }
    }

    public void print() {
        System.out.print("(");

        DecimalFormat df = new DecimalFormat("#.###");

        for (int i = 0; i < this.dimension; i++) {
            double component = this.components[i];
            if (component % 1 == 0) { // Verifica si el número es entero
                System.out.print((int)component); // Si es entero, se imprime sin decimales
            } else {
                System.out.print(df.format(component)); // Si no es entero, se imprime con tres decimales
            }

            if(i+1 < this.dimension){
                System.out.print("; ");
            } else {
                System.out.print(")");
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


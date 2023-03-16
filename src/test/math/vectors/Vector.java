package test.math.vectors;

import java.util.Scanner;
import java.text.DecimalFormat;

public class Vector {
    private final int dimension;
    private double[] components;

    public Vector(int dimension) {
        this.dimension = dimension;
        this.components = new double[dimension];
    }
    public Vector(Vector other) {
        this.dimension = other.dimension;
        this.components = new double[this.dimension];
        for (int i = 0; i < this.dimension; i++) {
            this.components[i] = other.components[i];
        }
    }
    public Vector(double[] components) {
        this.dimension = components.length;
        this.components = components;
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

    public boolean isZero() {
        for (int i = 0; i < components.length; i++) {
            if (components[i] != 0) {
                return false;
            }
        }
        return true;
    }


    public static void main(String[] args) {
        Vector vector = new Vector(3);
        vector.setComponentsFromConsole();
        vector.print();
    }

    public int getDimension() {
        return dimension;
    }

    public boolean isLinearCombinationOf(Vector other) {
        if (this.dimension != other.dimension) {
            throw new IllegalArgumentException("Vectors must have the same dimension.");
        }
        if (this.equals(other)) {
            return true;
        }
        if (this.isZero() || other.isZero()) {
            return false;
        }
        double[] thisComponents = this.components;
        double[] otherComponents = other.components;
        double scalar = 0.0;
        for (int i = 0; i < thisComponents.length; i++) {
            if (otherComponents[i] != 0.0) {
                scalar = thisComponents[i] / otherComponents[i];
                break;
            }
        }
        for (int i = 0; i < thisComponents.length; i++) {
            if (otherComponents[i] == 0.0 && thisComponents[i] != 0.0 ||
                    otherComponents[i] != 0.0 && Math.abs(thisComponents[i] / otherComponents[i] - scalar) > 1e-9) {
                return false;
            }
        }
        return true;
    }

    public Vector scalarMultiply(double scalar) {
        // Creamos una copia del vector para no modificarlo directamente
        Vector result = new Vector(dimension);
        for (int i = 0; i < dimension; i++) {
            result.setComponent(i, this.getComponent(i)* scalar);
        }
        return result;
    }


}


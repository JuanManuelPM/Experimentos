package test.vectors;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Scanner;

public class VectorSet {
    private final int dimension;
    private final ArrayList<Vector> vectors;
    private int numVectors;

    public VectorSet(int dimension) {
        this.dimension = dimension;
        this.vectors = new ArrayList<>();
    }

    public void addVector(Vector vector) {
        if (vector.getDimension() != this.dimension) {
            throw new IllegalArgumentException("El vector debe tener la misma dimensión que los demás vectores en el conjunto.");
        }
        this.vectors.add(vector);
        numVectors++;
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
        this.numVectors = vectors.size();
    }

    public void removeVector(Vector v) {
        vectors.remove(v);
        numVectors = vectors.size();
    }

    public void removeVector(int i) {
        vectors.remove(i);
        numVectors = vectors.size();
    }

    private Vector getVector(int i) {
        return vectors.get(i);
    }

    public VectorSet copy() {
        VectorSet copy = new VectorSet(this.dimension);
        for (int i = 0; i < this.vectors.size(); i++) {
            Vector vector = this.vectors.get(i);
            copy.addVector(new Vector(vector));
        }
        return copy;
    }

    public void fillWithGenericSet3d(){
        this.addVector(new Vector(new double[]{1, 5, 0}));
        this.addVector(new Vector(new double[]{6, 7, 0}));
        this.addVector(new Vector(new double[]{2, 10, 0}));
        this.addVector(new Vector(new double[]{0, 1, 0}));
        this.addVector(new Vector(new double[]{6, 0, 0}));
    }

    public void print() {
        System.out.print("{ ");
        int count = 0;
        for (Vector vector : this.vectors) {
            vector.print();
            count++;
            if (count != this.numVectors){
                System.out.print(",\n  ");
            }else{
                System.out.println(" }");
            }
        }
    }


    //_________________________________________________________

    public boolean isLinearlyIndependent() {
        /*
        Para verificar la independencia lineal de un conjunto de vectores, se utiliza el siguiente algoritmo:

        1- Si el número de vectores es mayor que la dimensión, entonces el conjunto es linealmente dependiente por definición.
        2- De lo contrario, se crea una matriz cuyas filas son los componentes de los vectores en el conjunto.
        3- Se aplica la eliminación gaussiana a la matriz, y se verifica si hay alguna fila cuyos elementos son todos cero.
        4- Si se encuentra tal fila, entonces el conjunto es linealmente dependiente, de lo contrario, es linealmente independiente.
        */
        int numVectors = this.vectors.size();

        // Si hay más vectores que la dimensión, el conjunto es siempre linealmente dependiente
        if (numVectors > this.dimension) {
            return false;
        }

        // Crear una matriz de vectores
        double[][] matrix = new double[numVectors][this.dimension];
        for (int i = 0; i < numVectors; i++) {
            Vector vector = this.vectors.get(i);
            for (int j = 0; j < this.dimension; j++) {
                matrix[i][j] = vector.getComponent(j);
            }
        }

        // Aplicar eliminación gaussiana
        for (int i = 0; i < numVectors; i++) {
            // Encuentra una fila con un elemento no nulo en la columna i
            int pivotRow = i;
            while (pivotRow < numVectors && matrix[pivotRow][i] == 0) {
                pivotRow++;
            }
            // Si no hay tal fila, continúa con la siguiente columna
            if (pivotRow == numVectors) {
                continue;
            }
            // Intercambia filas para que la fila con el pivote esté en la posición i
            if (pivotRow != i) {
                double[] temp = matrix[pivotRow];
                matrix[pivotRow] = matrix[i];
                matrix[i] = temp;
            }
            // Reduce la columna i a ceros, comenzando desde la fila i+1
            for (int j = i + 1; j < numVectors; j++) {
                double factor = matrix[j][i] / matrix[i][i];
                for (int k = i; k < this.dimension; k++) {
                    matrix[j][k] -= factor * matrix[i][k];
                }
            }
        }

        // Verificar si alguna fila es cero
        for (int i = 0; i < numVectors; i++) {
            boolean allZeros = true;
            for (int j = 0; j < this.dimension; j++) {
                if (matrix[i][j] != 0) {
                    allZeros = false;
                    break;
                }
            }
            if (allZeros) {
                return false;
            }
        }

        // Si no se encontró ninguna fila cero, el conjunto es linealmente independiente
        return true;
    }

    public boolean isLinearCombination(Vector vector) {
        if (vector.getDimension() != this.dimension) {
            throw new IllegalArgumentException("El vector debe tener la misma dimensión que los demás vectores en el conjunto.");
        }

        // Crear una matriz ampliada con los componentes de los vectores del conjunto
        double[][] augmentedMatrix = new double[this.vectors.size()][this.dimension + 1];
        for (int i = 0; i < this.vectors.size(); i++) {
            Vector v = this.vectors.get(i);
            for (int j = 0; j < this.dimension; j++) {
                augmentedMatrix[i][j] = v.getComponent(j);
            }
            augmentedMatrix[i][this.dimension] = vector.getComponent(i);
        }

        // Aplicar eliminación de Gauss-Jordan a la matriz ampliada
        for (int i = 0; i < this.vectors.size(); i++) {
            // Encontrar la fila con el pivote más grande en la columna actual
            int maxPivotRowIndex = i;
            double maxPivotValue = Math.abs(augmentedMatrix[i][i]);
            for (int j = i + 1; j < this.vectors.size(); j++) {
                double absValue = Math.abs(augmentedMatrix[j][i]);
                if (absValue > maxPivotValue) {
                    maxPivotRowIndex = j;
                    maxPivotValue = absValue;
                }
            }

            // Intercambiar la fila actual con la fila del pivote más grande
            if (maxPivotRowIndex != i) {
                double[] tempRow = augmentedMatrix[i];
                augmentedMatrix[i] = augmentedMatrix[maxPivotRowIndex];
                augmentedMatrix[maxPivotRowIndex] = tempRow;
            }

            // Hacer ceros debajo y encima del pivote en la columna actual
            for (int j = 0; j < this.vectors.size(); j++) {
                if (j != i) {
                    double factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];
                    for (int k = i + 1; k < this.dimension + 1; k++) {
                        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                    }
                    augmentedMatrix[j][i] = 0;
                }
            }
        }

        // Verificar si el vector se puede generar como una combinación lineal de los demás vectores
        for (int i = 0; i < this.vectors.size(); i++) {
            double ratio = augmentedMatrix[i][this.dimension] / augmentedMatrix[i][i];
            if (ratio != 0) {
                return false;
            }
        }
        return true;
    }

}
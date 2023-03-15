package test.vectors;

import java.util.ArrayList;
import java.util.Scanner;

public class VectorSet {
    private final int dimension;
    private final ArrayList<Vector> vectors;
    private int numVectors;

    public VectorSet(int dimension) {
        this.dimension = dimension;
        this.vectors = new ArrayList<>();
        this.numVectors = vectors.size();
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

    public VectorSet getLinearlyDependentVectors() {

        /*
        Este metodo devuelve un conjunto de vectores que son combinación lineal del resto en el conjunto original.
        Este método utiliza la eliminación gaussiana para encontrar los vectores que son combinación lineal,
        y luego los elimina del conjunto original para convertirlo en un conjunto linealmente independiente.
         */
        VectorSet dependentVectors = new VectorSet(this.dimension);

        // Si el conjunto es linealmente independiente, no hay vectores que sean combinación lineal del resto
        if (isLinearlyIndependent()) {
            return dependentVectors;
        }

        // Crear una matriz de vectores
        double[][] matrix = new double[this.numVectors][this.dimension];
        for (int i = 0; i < this.numVectors; i++) {
            Vector vector = this.vectors.get(i);
            for (int j = 0; j < this.dimension; j++) {
                matrix[i][j] = vector.getComponent(j);
            }
        }

        // Buscar vectores que son combinación lineal del resto
        boolean foundDependentVector = true;
        while (foundDependentVector) {
            foundDependentVector = false;
            for (int i = 0; i < this.numVectors; i++) {
                // Buscar una fila con un único elemento no nulo
                int numNonZeroElements = 0;
                int nonZeroColumn = -1;
                for (int j = 0; j < this.dimension; j++) {
                    if (matrix[i][j] != 0) {
                        numNonZeroElements++;
                        nonZeroColumn = j;
                    }
                }
                // Si se encontró una fila con un único elemento no nulo, el vector es combinación lineal del resto
                if (numNonZeroElements == 1) {
                    foundDependentVector = true;
                    dependentVectors.addVector(this.vectors.get(i));
                    // Eliminar el vector correspondiente y la columna correspondiente de la matriz
                    for (int j = 0; j < this.numVectors; j++) {
                        if (j != i && matrix[j][nonZeroColumn] != 0) {
                            double factor = matrix[j][nonZeroColumn] / matrix[i][nonZeroColumn];
                            for (int k = nonZeroColumn; k < this.dimension; k++) {
                                matrix[j][k] -= factor * matrix[i][k];
                            }
                        }
                    }
                    this.vectors.remove(i);
                    this.numVectors--;
                    break;
                }
            }
        }

        return dependentVectors;
    }

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
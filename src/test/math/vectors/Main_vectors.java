package test.math.vectors;

public class Main_vectors {
    public static void main(String[] args) {

        VectorSet conjuntoDeVectores = new VectorSet(3);
        conjuntoDeVectores.fillWithGenericSet3d();

        Vector vectorExtra = new Vector(new double[]{1,2,3});
        //conjuntoDeVectores.addVector(vectorExtra);

        conjuntoDeVectores.print();

        System.out.println("¿el conjunto es linearmente independiente? --> " + conjuntoDeVectores.isLinearlyIndependent());

        vectorExtra.print();

        //System.out.println("el conjunto de vectores extraibles es: ");
        //vectoresExtraibles.print();
        //Vector vector = new Vector(3);
        //vectorSet.addVector(vector);
        //vectorSet.print();

    }
}

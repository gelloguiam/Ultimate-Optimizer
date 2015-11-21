getMinRatio = function (vect) {
  while(min(vect) < 0) {
    vect = vect[-(which(vect == min(vect)))]; #remove element if min is < 0
  }
  return(min(vect)); #retrun min ratio value
}

GaussJordan = function(mat, rowCount, colCount, pivotElementIndex, pivotColumnIndex) {
  options(digits=4);
  counter = 1;
  while(counter <= rowCount) {
    if(counter != pivotElementIndex) {
      multiplier = mat[counter, pivotColumnIndex];
      normalizer = mat[pivotElementIndex,];
      normalizer = normalizer*multiplier;
      mat[counter,] = mat[counter,] - normalizer;
    }
    counter = counter + 1;
  }
  return(mat); #return matrix result of Gauss Jordan
}

UltimateOptimizer = function() {
  options(digits=4);
  mat = read.csv("data.csv"); #read data from the directory
  #reference: http://www.r-tutor.com/r-introduction/data-frame/data-import
  
  currentDirectory = getwd(); #get working directory
  folder = "iterations";
  
  if(!file.exists(folder)) #check if subdirectory iterations exist
  dir.create(file.path(currentDirectory, folder)); #create sub directory if not
  #reference: http://stackoverflow.com/questions/4216753/check-existence-of-directory-and-create-if-doesnt-exist
  
  rowCount = nrow(mat); #get row count
  colCount = ncol(mat); #get column count
  iteration = 1;
  
  while(TRUE) {
    minval = min(mat[rowCount,]); #get minimum value of the last row
    
    if(minval >= 0) break;

    pivotColumnIndex = which(mat[rowCount,] == minval); #get index of the min value
    pivotColumn = mat[,pivotColumnIndex]; #get pivot column
    
    RHS = mat[,colCount]; #get last column
    ratio = RHS/pivotColumn; #compute for ratio of RHS and pivot column
    ratio = ratio[-length(ratio)]; #remove ratio got from last row
    minRatio = getMinRatio(ratio); #get minimum ratio
  
    pivotElementIndex = which(ratio[] == minRatio); #get pivot element index
    pivotElement = mat[pivotElementIndex, pivotColumnIndex]; #get pivot element
      
    mat[pivotElementIndex,] = mat[pivotElementIndex,]/pivotElement; #normalize row
    
    mat = GaussJordan(mat, rowCount, colCount, pivotElementIndex, pivotColumnIndex); #perform Gauss Jordan
    
    fileName = paste("iterations/iteration_",iteration,".csv", sep="");
    print(fileName);
    write.table(mat, file=fileName, row.names=FALSE, col.names=FALSE, sep=",");
    #reference: http://rprogramming.net/write-csv-in-r/

    print(mat);
    iteration = iteration + 1;
  }

}
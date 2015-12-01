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

Optimizer = function(mat, filename) {
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

  
    fileName = paste(filename,iteration,".csv", sep="");
    write.table(mat, file=fileName, row.names=FALSE, col.names=FALSE, sep=",");
    #reference: http://rprogramming.net/write-csv-in-r/
    
    i = 1;
    variables = colnames(mat);
    cat("\nBASIC SOLUTIION:\n");
    
    while (i<colCount) {
      temp = mat[,i];
      value = mat[,colCount];
      if(sum(temp) == 1) {
        valIndex = which(temp == 1);
        cat(variables[i], "=", value[valIndex],"\n");
      }
      else {
        cat(variables[i],"= 0\n"); 
      }
      #      print(sum(mat[,i]));
      i = i + 1;
    }
    
    #    print(mat);
    iteration = iteration + 1;
  }
}

CostProjector = function() {
  options(digits=10);
  setwd("C:/xampp/htdocs/workspace/UltimateOptimizer");
  
  minmat = read.csv("datamin.csv"); #read data from the directory
  maxmat = read.csv("datamax.csv"); #read data from the directory
  
  mat = read.csv("datamin.csv"); #read data from the directory
  #reference: http://www.r-tutor.com/r-introduction/data-frame/data-import
  
  currentDirectory = getwd(); #get working directory
  folder = "iterations";
  
  if(!file.exists(folder)) #check if subdirectory iterations exist
  dir.create(file.path(currentDirectory, folder)); #create sub directory if not
  #reference: http://stackoverflow.com/questions/4216753/check-existence-of-directory-and-create-if-doesnt-exist
  
  #Minimum Standard
  fileName = "iterations/min_iteration_";
  Optimizer(minmat, fileName);
  
  #Maximum Standard
  fileName = "iterations/max_iteration_";
  Optimizer(maxmat, fileName);

}
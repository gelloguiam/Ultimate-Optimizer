#Author: Angelo C. Guiam
#Date Created: December 1, 2015
#CMSC 150 EF-4L

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
  currentDirectory = getwd(); #get working directory
  folder = "iterations";
  
  if(!file.exists(folder)) #check if subdirectory iterations exist
    dir.create(file.path(currentDirectory, folder)); #create sub directory if not
  #reference: http://stackoverflow.com/questions/4216753/check-existence-of-directory-and-create-if-doesnt-exist
  
  rowCount = nrow(mat); #get row count
  colCount = ncol(mat); #get column count
  iteration = 1;
  
  while(TRUE) {
    print(mat);
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
    
    #print(mat);
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
  
  #Minimum Standard
  fileName = "iterations/min_iteration_";
  Optimizer(minmat, fileName);
  
  #Maximum Standard
  fileName = "iterations/max_iteration_";
  Optimizer(maxmat, fileName);
}

UltimateOptimizer = function() {
  options(digits=10);
  setwd("C:/xampp/htdocs/workspace/UltimateOptimizer");

  alphabet = c('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y');
  objfxn = "";
  const = c();
  coeff = c();
  RHS = c();
  constCount = 0;
  goal = "";
  
  conn = file("data.txt", open="r");
  linn = readLines(conn)
  #reference: http://stackoverflow.com/questions/12626637/reading-a-text-file-in-r-line-by-line
  for (i in 1:length(linn)){
    if(i == 1) constCount = linn[i];
    if(i==2) goal = linn[i];
    if(i==3) objfxn = linn[i];
    if(i>3) const = c(const, linn[i]);
  }
  close(conn);
  constCount = as.numeric(constCount);
  
  slackMat = c();
  i=1;
  while(i<=(constCount+1)) { #construct slack variable matrix
    j=1;
    while(j<=(constCount+1)) {
      if(i==j) slackMat = c(slackMat, 1);
      if(i!=j) slackMat = c(slackMat, 0);
      j = j+1;
    }
    i = i+1;
  }
  
  slackMat = matrix(slackMat, ncol=constCount+1); #construct slack variable matrix

  i=1;
  while (i<=constCount) {
    coeff = c(coeff, strsplit(const[i], split=" ")); #parse constraints
    i = i+1;
  }
  
  coeff = c(coeff, strsplit(objfxn, split=" ")); #parse objective function
  tableau = matrix(unlist(coeff), nrow=(constCount+1), byrow = TRUE);
  
  i=3;
  colcount = ncol(tableau);
  
  tableau = tableau[,-2]; #remove first operation column
  while(i<=colcount) {
    tableau = tableau[,-i]; #remove operations
    i = i+1;    
  }

  i=1;
  while(i <= length(alphabet)) {
    tableau = gsub(alphabet[i], "", tableau); #extract coefficients
    i = i+1;
  }
  
  tableau = gsub('z', 1, tableau);

  if(goal == "minimize") {
    tableau = t(tableau);
#    print(tableau);
  }
  RHS = tableau[,ncol(tableau)];
  RHS[length(RHS)] = 0;
  
  
  i=1;
  while(i <= nrow(tableau)) {
    tableau[i] = as.numeric(tableau[i]);
    i = i+1;
  }
  
  tableau = tableau[,-ncol(tableau)]; #remove RHS
  hehe = tableau[nrow(tableau),];
  
  tableau[nrow(tableau),] = as.numeric(tableau[nrow(tableau),])*-1; #negate objective function
  
  tableau = cbind(tableau,slackMat); #concat slack Variable
  tableau = cbind(tableau, RHS); #concat RHS
  
  varCount = ncol(tableau) - constCount - 2; #get number of vaiables
  colhead = c(); #construct matrix column head
  
  i=1;
  while(i<=varCount) {
    colhead = c(colhead, alphabet[i]);
    i = i+1;
  }
  
  i=1;
  while(i<=constCount) {
    colhead = c(colhead, paste("s",i,sep=""));
    i = i+1;
  }

  colhead = c(colhead, "Z");
  colhead = c(colhead, "RHS");

  colCount = ncol(tableau);
  tableau = as.numeric(tableau);
  tableau = matrix(tableau, ncol=colCount);
  
  colnames(tableau) = colhead; #change tableau head
  fileName = "iterations/iteration_";
  Optimizer(noquote(tableau), fileName);

}
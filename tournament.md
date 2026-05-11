Tournament has fields:
started date
type (knockout)
active (bool)
visibility (public, private)
And Tournament also has Phases (orderd) (must always have Phase one)

Phase has an order, could be represented as field (1,2,3..)
and be Open/Closed (instead of active/inactive): A phase cannot close if the prev is open
Teams
And matches 

